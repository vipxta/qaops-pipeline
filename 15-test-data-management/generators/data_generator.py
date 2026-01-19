#!/usr/bin/env python3
"""
Test Data Generator
Genera dados sintéticos para testes com integridade referencial
"""

import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
from faker import Faker
import argparse

fake = Faker(['pt_BR', 'en_US'])

@dataclass
class User:
    id: str
    email: str
    name: str
    phone: str
    created_at: str
    plan: str = 'free'
    is_active: bool = True

@dataclass
class Order:
    id: str
    user_id: str
    total: float
    status: str
    items: List[Dict[str, Any]] = field(default_factory=list)
    created_at: str = ''

@dataclass
class Product:
    id: str
    name: str
    price: float
    category: str
    stock: int
    sku: str

class TestDataGenerator:
    """Gerador de dados de teste com integridade referencial"""
    
    def __init__(self, seed: Optional[int] = None):
        if seed:
            Faker.seed(seed)
            random.seed(seed)
        
        self.users: List[User] = []
        self.products: List[Product] = []
        self.orders: List[Order] = []
    
    def generate_users(self, count: int = 100) -> List[User]:
        """Gera usuários sintéticos"""
        plans = ['free', 'basic', 'premium', 'enterprise']
        
        for i in range(count):
            user = User(
                id=f'user_{i+1:05d}',
                email=fake.unique.email(),
                name=fake.name(),
                phone=fake.phone_number(),
                created_at=fake.date_time_between(
                    start_date='-2y',
                    end_date='now'
                ).isoformat(),
                plan=random.choices(
                    plans,
                    weights=[0.5, 0.25, 0.15, 0.1]
                )[0],
                is_active=random.random() > 0.1
            )
            self.users.append(user)
        
        print(f'✅ Generated {count} users')
        return self.users
    
    def generate_products(self, count: int = 50) -> List[Product]:
        """Gera produtos sintéticos"""
        categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']
        
        for i in range(count):
            product = Product(
                id=f'prod_{i+1:05d}',
                name=fake.catch_phrase(),
                price=round(random.uniform(10, 500), 2),
                category=random.choice(categories),
                stock=random.randint(0, 1000),
                sku=fake.unique.bothify(text='???-#####').upper()
            )
            self.products.append(product)
        
        print(f'✅ Generated {count} products')
        return self.products
    
    def generate_orders(self, count: int = 200) -> List[Order]:
        """Gera pedidos com integridade referencial"""
        if not self.users or not self.products:
            raise ValueError('Generate users and products first')
        
        statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        
        for i in range(count):
            user = random.choice(self.users)
            num_items = random.randint(1, 5)
            items = []
            total = 0
            
            for _ in range(num_items):
                product = random.choice(self.products)
                quantity = random.randint(1, 3)
                item_total = product.price * quantity
                total += item_total
                items.append({
                    'product_id': product.id,
                    'quantity': quantity,
                    'price': product.price,
                    'subtotal': round(item_total, 2)
                })
            
            order = Order(
                id=f'order_{i+1:06d}',
                user_id=user.id,
                total=round(total, 2),
                status=random.choice(statuses),
                items=items,
                created_at=fake.date_time_between(
                    start_date='-1y',
                    end_date='now'
                ).isoformat()
            )
            self.orders.append(order)
        
        print(f'✅ Generated {count} orders')
        return self.orders
    
    def mask_pii(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Mascara dados pessoais identificaveis (PII)"""
        masked = data.copy()
        
        # Mascarar email
        if 'email' in masked:
            email = masked['email']
            local, domain = email.split('@')
            masked['email'] = f"{local[:2]}***@{domain}"
        
        # Mascarar telefone
        if 'phone' in masked:
            masked['phone'] = masked['phone'][:4] + '*' * 6 + masked['phone'][-2:]
        
        # Mascarar nome
        if 'name' in masked:
            parts = masked['name'].split()
            masked['name'] = f"{parts[0]} ***" if len(parts) > 1 else "***"
        
        return masked
    
    def anonymize(self, data: Dict[str, Any], salt: str = 'qa-test') -> Dict[str, Any]:
        """Anonimiza dados usando hashing"""
        anonymized = data.copy()
        pii_fields = ['email', 'phone', 'name', 'address']
        
        for field in pii_fields:
            if field in anonymized:
                original = str(anonymized[field])
                hashed = hashlib.sha256((original + salt).encode()).hexdigest()[:12]
                anonymized[field] = f"anon_{hashed}"
        
        return anonymized
    
    def export_json(self, filename: str) -> None:
        """Exporta dados para JSON"""
        data = {
            'generated_at': datetime.now().isoformat(),
            'statistics': {
                'users': len(self.users),
                'products': len(self.products),
                'orders': len(self.orders)
            },
            'users': [asdict(u) for u in self.users],
            'products': [asdict(p) for p in self.products],
            'orders': [asdict(o) for o in self.orders]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f'💾 Exported to {filename}')
    
    def export_sql(self, filename: str) -> None:
        """Exporta dados como SQL INSERT statements"""
        lines = ['-- Test Data Generated by QAOps Pipeline', '']
        
        # Users
        lines.append('-- USERS')
        for user in self.users:
            lines.append(
                f"INSERT INTO users (id, email, name, phone, created_at, plan, is_active) "
                f"VALUES ('{user.id}', '{user.email}', '{user.name}', '{user.phone}', "
                f"'{user.created_at}', '{user.plan}', {str(user.is_active).lower()});"
            )
        
        # Products
        lines.append('\n-- PRODUCTS')
        for product in self.products:
            lines.append(
                f"INSERT INTO products (id, name, price, category, stock, sku) "
                f"VALUES ('{product.id}', '{product.name}', {product.price}, "
                f"'{product.category}', {product.stock}, '{product.sku}');"
            )
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        print(f'💾 Exported SQL to {filename}')


def main():
    parser = argparse.ArgumentParser(description='Generate test data')
    parser.add_argument('--users', type=int, default=100, help='Number of users')
    parser.add_argument('--products', type=int, default=50, help='Number of products')
    parser.add_argument('--orders', type=int, default=200, help='Number of orders')
    parser.add_argument('--seed', type=int, help='Random seed for reproducibility')
    parser.add_argument('--output', type=str, default='test-data.json', help='Output file')
    parser.add_argument('--format', choices=['json', 'sql'], default='json', help='Output format')
    args = parser.parse_args()
    
    generator = TestDataGenerator(seed=args.seed)
    
    print('\n🗃️  Test Data Generator')
    print('=' * 40)
    
    generator.generate_users(args.users)
    generator.generate_products(args.products)
    generator.generate_orders(args.orders)
    
    if args.format == 'json':
        generator.export_json(args.output)
    else:
        generator.export_sql(args.output.replace('.json', '.sql'))
    
    print('=' * 40)
    print('✅ Data generation complete\n')


if __name__ == '__main__':
    main()
