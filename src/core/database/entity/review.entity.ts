import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'temple_id', type: 'int', nullable: true })
  templeId: number;

  @Column({ name: 'event_id', type: 'int', nullable: true })
  eventId: number;

  @Column({ name: 'content', type: 'varchar', length: 1000 })
  content: string;

  @Column({ name: 'rating', type: 'int' })
  rating: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
