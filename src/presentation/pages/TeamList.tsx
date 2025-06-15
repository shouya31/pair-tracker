import { useState, useEffect } from 'react';
import { TeamDTO, PairDTO } from '../../application/team/dto/TeamDTO';
import { UserDTO } from '../../application/user/dto/UserDTO';

interface TeamListProps {
  teams: TeamDTO[];
}

export default function TeamList({ teams }: TeamListProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">チーム一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

interface TeamCardProps {
  team: TeamDTO;
}

function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{team.name}</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">メンバー</h3>
        <ul className="space-y-1">
          {team.members.map(member => (
            <MemberItem key={member.id} member={member} />
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">ペア</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.pairs.map(pair => (
            <PairCard key={pair.id} pair={pair} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MemberItemProps {
  member: UserDTO;
}

function MemberItem({ member }: MemberItemProps) {
  return (
    <li className="flex items-center space-x-2">
      <span className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
      <span>{member.email}</span>
    </li>
  );
}

interface PairCardProps {
  pair: PairDTO;
}

function PairCard({ pair }: PairCardProps) {
  return (
    <div className="bg-gray-50 rounded p-3">
      <div className="font-medium mb-2">ペア {pair.label}</div>
      <ul className="space-y-1">
        {pair.members.map(member => (
          <MemberItem key={member.id} member={member} />
        ))}
      </ul>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Enrolled':
      return 'bg-green-500';
    case 'Suspended':
      return 'bg-yellow-500';
    case 'Withdrawn':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
} 