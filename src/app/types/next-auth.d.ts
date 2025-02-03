import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    access_token: string; // Add custom properties
    role: string; // Add custom properties
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      access_token: string; // Add custom properties
      role: string; // Add custom properties
    };
  }
}
