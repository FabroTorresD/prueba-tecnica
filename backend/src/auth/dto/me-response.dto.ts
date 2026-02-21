export class MeResponseDto {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
    birthDate: Date | null;
    phone: string | null;
  };
}