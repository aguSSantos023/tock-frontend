// Lo que enviamos al hacer Login
export interface LoginRequest {
  email: string;
  password: string;
}

// Lo que enviamos al Registrarse
export interface RegisterRequest {
  email: string;
  password: string;
}

// Lo que nos devuelve el Backend (según tu controlador de Auth)
export interface AuthResponse {
  token?: string;
  message: string;
  user?: {
    id: number;
    email: string;
    storage_limit: string;
  };
}
