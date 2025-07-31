import { Quote } from '../../quotes/entities/quote.entity';
import { Users } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'votes' })
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('vote_user_id')
  @OneToOne(() => Users, (users) => users.id)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Index('vote_quote_id')
  @ManyToOne(() => Quote, (quote) => quote.id)
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  constructor(id: string, user: Users, quote: Quote) {
    this.id = id;
    this.user = user;
    this.quote = quote;
  }
}
