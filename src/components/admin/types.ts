export interface Admin {
  id: string;
  username: string;
  role: string;
  password?: string;
}

export interface Store {
  name: string;
  logo: string;
  bgColor: string;
  color: string;
  active: boolean;
  deals: Deal[];
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  link: string;
  active: boolean;
}

export interface FooterLink {
  id: string;
  title: string;
  link: string;
  active: boolean;
} 