import { createConnection } from 'mysql2/promise';

export const initializeDatabase = async () => {
  try {
    // 초기 연결 (데이터베이스 지정없이)
    const connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234'
    });

    // 데이터베이스 생성
    await connection.query('CREATE DATABASE IF NOT EXISTS lecture');
    console.log('Database initialized successfully');

    // 연결 종료
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};