import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '메뉴 이름' })
  name: string;

  @Column({ type: 'int', comment: '가격' })
  price: number;

  @Column({ type: 'varchar', length: 50, comment: '일식, 중식, 양식 등' })
  category: string;

  @Column({ type: 'text', nullable: true, comment: '메뉴 설명' })
  description: string;

  @Column()
  restaurant_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
