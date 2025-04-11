import { FC } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userType: 'user' | 'merchant';
  mode?: 'register' | 'login';
}

declare const RegisterModal: FC<RegisterModalProps>;

export default RegisterModal; 