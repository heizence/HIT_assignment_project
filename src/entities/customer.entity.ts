import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '로그인 ID' })
  login_id: string;

  @Column({ type: 'varchar', length: 255, comment: '해시된 비밀번호' })
  password: string;

  @Column({ type: 'varchar', length: 100, comment: '고객 이름' })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '연락처' })
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.customer)
  reservations: Reservation[];
}
