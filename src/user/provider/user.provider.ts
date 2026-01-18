/* eslint-disable prettier/prettier */

import { User } from '../entity/user.entity';

export const UserProvider = [
  {
    provide: 'USER_REPOSITORY',
    useValue: User,
  },
];
