// apps/api/src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName?: string;

  @Column({ type: 'varchar', nullable: true })
  googleId?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => Wallet, wallet => wallet.user, { cascade: true })
  @JoinColumn()
  wallet: Wallet;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];
}
