/**
 * Consumer Contract Test - User Service
 * Testes de contrato do lado do consumidor
 */

import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { resolve } from 'path';
import axios from 'axios';

const { like, eachLike, regex, integer, string, boolean } = MatchersV3;

const provider = new PactV3({
  consumer: 'OrderService',
  provider: 'UserService',
  dir: resolve(process.cwd(), 'pacts'),
  logLevel: 'info'
});

describe('📝 User Service Contract Tests', () => {
  describe('GET /api/users/:id', () => {
    it('returns user when exists', async () => {
      // Arrange
      const userId = '12345';
      const expectedUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        plan: 'premium',
        isActive: true
      };

      await provider
        .given('user exists', { userId })
        .uponReceiving('a request for an existing user')
        .withRequest({
          method: 'GET',
          path: `/api/users/${userId}`,
          headers: {
            'Accept': 'application/json',
            'Authorization': like('Bearer token123')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            id: string(expectedUser.id),
            email: regex(/^[\w.-]+@[\w.-]+\.\w+$/, expectedUser.email),
            name: string(expectedUser.name),
            plan: regex(/^(free|basic|premium|enterprise)$/, expectedUser.plan),
            isActive: boolean(expectedUser.isActive),
            createdAt: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '2024-01-15T10:30:00Z')
          }
        });

      // Act & Assert
      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(`${mockServer.url}/api/users/${userId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer token123'
          }
        });

        expect(response.status).toBe(200);
        expect(response.data.id).toBe(userId);
        expect(response.data.email).toMatch(/^[\w.-]+@[\w.-]+\.\w+$/);
      });
    });

    it('returns 404 when user does not exist', async () => {
      const userId = 'non-existent';

      await provider
        .given('user does not exist', { userId })
        .uponReceiving('a request for a non-existent user')
        .withRequest({
          method: 'GET',
          path: `/api/users/${userId}`,
          headers: {
            'Accept': 'application/json',
            'Authorization': like('Bearer token123')
          }
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            error: 'NOT_FOUND',
            message: string('User not found')
          }
        });

      await provider.executeTest(async (mockServer) => {
        try {
          await axios.get(`${mockServer.url}/api/users/${userId}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer token123'
            }
          });
          fail('Should have thrown 404');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.error).toBe('NOT_FOUND');
        }
      });
    });
  });

  describe('GET /api/users', () => {
    it('returns list of users', async () => {
      await provider
        .given('users exist')
        .uponReceiving('a request for user list')
        .withRequest({
          method: 'GET',
          path: '/api/users',
          query: {
            page: '1',
            limit: '10'
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': like('Bearer token123')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            data: eachLike({
              id: string('user-1'),
              email: string('user@example.com'),
              name: string('User Name'),
              isActive: boolean(true)
            }),
            pagination: {
              page: integer(1),
              limit: integer(10),
              total: integer(100),
              totalPages: integer(10)
            }
          }
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.get(`${mockServer.url}/api/users`, {
          params: { page: 1, limit: 10 },
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer token123'
          }
        });

        expect(response.status).toBe(200);
        expect(response.data.data).toBeInstanceOf(Array);
        expect(response.data.pagination.page).toBe(1);
      });
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'SecurePass123!'
      };

      await provider
        .given('no user with this email exists')
        .uponReceiving('a request to create a user')
        .withRequest({
          method: 'POST',
          path: '/api/users',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': like('Bearer admin-token')
          },
          body: {
            email: string(newUser.email),
            name: string(newUser.name),
            password: string(newUser.password)
          }
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            id: string('new-user-id'),
            email: string(newUser.email),
            name: string(newUser.name),
            plan: string('free'),
            isActive: boolean(true),
            createdAt: regex(/^\d{4}-\d{2}-\d{2}/, '2024-01-15')
          }
        });

      await provider.executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/users`,
          newUser,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer admin-token'
            }
          }
        );

        expect(response.status).toBe(201);
        expect(response.data.email).toBe(newUser.email);
        expect(response.data.id).toBeDefined();
      });
    });
  });
});
