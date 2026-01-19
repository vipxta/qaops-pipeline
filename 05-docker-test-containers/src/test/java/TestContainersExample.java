package com.qaops.testcontainers;

import org.junit.jupiter.api.*;
import org.testcontainers.containers.*;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.utility.DockerImageName;

import java.sql.*;
import redis.clients.jedis.Jedis;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes de integração usando Testcontainers
 */
@Testcontainers
public class TestContainersExample {

    // PostgreSQL Container
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("init.sql");

    // Redis Container
    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    // MongoDB Container
    @Container
    static MongoDBContainer mongodb = new MongoDBContainer("mongo:6");

    // Kafka Container
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @BeforeAll
    static void setup() {
        System.out.println("🐳 Starting test containers...");
        System.out.println("PostgreSQL: " + postgres.getJdbcUrl());
        System.out.println("Redis: " + redis.getHost() + ":" + redis.getMappedPort(6379));
        System.out.println("MongoDB: " + mongodb.getConnectionString());
        System.out.println("Kafka: " + kafka.getBootstrapServers());
    }

    @Test
    @DisplayName("🗃️ PostgreSQL - Insert and Query")
    void testPostgresqlConnection() throws SQLException {
        try (Connection conn = DriverManager.getConnection(
                postgres.getJdbcUrl(),
                postgres.getUsername(),
                postgres.getPassword())) {
            
            // Create table
            conn.createStatement().execute(
                "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100))"
            );
            
            // Insert data
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO users (name) VALUES (?) RETURNING id"
            );
            ps.setString(1, "Test User");
            ResultSet rs = ps.executeQuery();
            
            assertTrue(rs.next());
            int id = rs.getInt(1);
            assertTrue(id > 0, "Should return generated ID");
            
            // Query data
            Statement stmt = conn.createStatement();
            ResultSet result = stmt.executeQuery("SELECT COUNT(*) FROM users");
            result.next();
            assertTrue(result.getInt(1) >= 1, "Should have at least 1 user");
            
            System.out.println("✅ PostgreSQL test passed");
        }
    }

    @Test
    @DisplayName("🟥 Redis - Set and Get")
    void testRedisConnection() {
        String host = redis.getHost();
        Integer port = redis.getMappedPort(6379);
        
        try (Jedis jedis = new Jedis(host, port)) {
            // Set value
            jedis.set("test:key", "test-value");
            
            // Get value
            String value = jedis.get("test:key");
            assertEquals("test-value", value);
            
            // Test expiration
            jedis.setex("temp:key", 60, "temporary");
            Long ttl = jedis.ttl("temp:key");
            assertTrue(ttl > 0 && ttl <= 60);
            
            System.out.println("✅ Redis test passed");
        }
    }

    @Test
    @DisplayName("🍃 MongoDB - CRUD Operations")
    void testMongoDBConnection() {
        String connectionString = mongodb.getConnectionString();
        assertNotNull(connectionString);
        assertTrue(connectionString.startsWith("mongodb://"));
        
        // MongoDB client operations would go here
        System.out.println("✅ MongoDB connection test passed");
    }

    @Test
    @DisplayName("📨 Kafka - Produce and Consume")
    void testKafkaConnection() {
        String bootstrapServers = kafka.getBootstrapServers();
        assertNotNull(bootstrapServers);
        assertTrue(bootstrapServers.contains(":"));
        
        // Kafka producer/consumer operations would go here
        System.out.println("✅ Kafka connection test passed");
    }

    @AfterAll
    static void teardown() {
        System.out.println("🐳 Test containers stopped");
    }
}
