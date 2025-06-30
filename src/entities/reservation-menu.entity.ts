import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Menu } from './menu.entity';

@Entity('reservation_menus')
export class ReservationMenu {
  @PrimaryColumn()
  reservation_id: number;

  @PrimaryColumn()
  menu_id: number;

  @Column({ type: 'int', default: 1, comment: '주문 수량' })
  quantity: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.reservationMenus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Menu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;
}
