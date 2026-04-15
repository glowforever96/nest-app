import { Injectable, NotFoundException } from '@nestjs/common';

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Kim',
      email: 'kim@example.com',
      age: 20,
    },
    {
      id: 2,
      name: 'Lee',
      email: 'lee@example.com',
      age: 21,
    },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  search(name: string) {
    const user = this.users.find(
      (user) => user.name.toLowerCase() === name.toLowerCase(),
    );
    console.log(user);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  create(name: string, email: string, age: number) {
    const newUser = {
      id: this.users.length > 0 ? this.users[this.users.length - 1].id + 1 : 1,
      name,
      email,
      age,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, name?: string, email?: string, age?: number) {
    const user = this.findOne(id);
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;

    return user;
  }

  remove(id: number) {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const deletedUser = this.users[index];
    this.users.splice(index, 1);
    return deletedUser;
  }
}
