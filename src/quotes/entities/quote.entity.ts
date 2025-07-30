import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Vote } from 'src/votes/entities/vote.entity';

@Entity({ name: 'quotes' })
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('quote_text')
  @Column({ type: 'varchar', length: 255 })
  text: string;

  @ManyToOne(() => Users, (user) => user.quotes)
  @JoinColumn({ name: 'user_id' })
  user: Promise<Users>;

  @OneToMany(() => Vote, (vote) => vote.quote)
  votes: Promise<Vote[]>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  constructor(id: string, text: string, user: Users) {
    this.id = id;
    this.text = text;
    this.user = Promise.resolve(user);
  }
}
