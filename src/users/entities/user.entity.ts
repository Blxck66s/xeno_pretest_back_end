import { Quote } from 'src/quotes/entities/quote.entity';
import { Vote } from 'src/votes/entities/vote.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('user_username', { unique: true })
  @Column({ type: 'varchar', length: 40, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 40 })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Quote, (quote) => quote.user)
  quotes: Promise<Quote[]>;

  @OneToOne(() => Vote, (vote) => vote.user)
  vote: Promise<Vote>;

  constructor(id: string, username: string, password: string) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}
