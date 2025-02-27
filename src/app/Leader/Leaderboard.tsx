'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchCapsuleData } from '../utils/suledata'
import { Trophy, Medal, Award } from 'lucide-react'

type CapsuleContent = {
  name: string;
  image_url: string;
  text_content: string;
  votes_num: string;
  owner_address: string;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<CapsuleContent[]>([])

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCapsuleData();
      const sortedData = data.sort((a, b) => parseInt(b.votes_num) - parseInt(a.votes_num));
      setLeaderboardData(sortedData);
    };

    loadData();
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold text-center">排行榜</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4 font-semibold">排名</th>
              <th className="p-4 font-semibold">标题</th>
              <th className="p-4 font-semibold">地址</th>
              <th className="p-4 font-semibold">票数</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item, index) => (
              <motion.tr
                key={item.owner_address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <span className="mr-2 font-bold">{index + 1}</span>
                    {getRankIcon(index + 1)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{item.name}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-600">{truncateAddress(item.owner_address)}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-blue-600">{item.votes_num}</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

