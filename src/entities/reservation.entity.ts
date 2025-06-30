import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Restaurant } from './restaurant.entity';
import { ReservationMenu } from './reservation-menu.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', comment: '예약 시작 시각' })
  start_time: Date;

  @Column({ type: 'datetime', comment: '예약 종료 시각' })
  end_time: Date;

  @Column({ type: 'int', comment: '예약 인원수' })
  party_size: number;

  @Column()
  customer_id: number;

  @Column()
  restaurant_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(
    () => ReservationMenu,
    (reservationMenu) => reservationMenu.reservation,
  )
  reservationMenus: ReservationMenu[];
}
