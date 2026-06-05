import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock environment variables for tests
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.GEMINI_API_KEY = 'AIzaSy-test-key';
process.env.TAVILY_API_KEY = 'tvly-test-key';
process.env.DATABASE_URL = 'postgres://test:test@localhost/test';
