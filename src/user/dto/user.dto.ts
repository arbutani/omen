/* eslint-disable prettier/prettier */

import moment from 'moment';

export class UserDto {
  id: string;
  name: string;
  mobile: string;
  email: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    data = data.dataValues ? data.dataValues : data;

    this.id = data.id;
    this.mobile = data.mobile;
    this.name = data.name;
    this.email = data.email;

    const createdAt = data.createdAt
      ? data.createdAt
      : data.created_at
        ? data.created_at
        : '';
    const updatedAt = data.updatedAt
      ? data.updatedAt
      : data.updated_at
        ? data.updated_at
        : '';

    if (createdAt) {
      this.createdAt = moment(createdAt, 'YYYY-MM-DD HH:mm:ss').format(
        'DD-MM-YYYY hh:mm A',
      );
    }

    if (updatedAt) {
      this.updatedAt = moment(updatedAt, 'YYYY-MM-DD HH:mm:ss').format(
        'DD-MM-YYYY hh:mm A',
      );
    }
  }
}
