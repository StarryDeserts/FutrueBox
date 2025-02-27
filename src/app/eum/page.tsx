"use client"

import { useState } from "react"
import Menu1Content from "../capsule/page"
import Menu2Content from "../Leader/Leaderboard"

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = ["胶囊广场", "投票排行"]

  const tabComponents = [<Menu1Content key="menu1" />, <Menu2Content key="menu2" />]

  return (
    <div className="px-6">
      {" "}
      {/* Added left and right padding */}
      <nav className="flex justify-center mb-8">
        <div className="flex space-x-1 rounded-lg bg-white p-1 shadow-lg">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                activeTab === index ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <div className="border-x border-gray-200">
        {" "}
        {/* Added left and right border only */}
        {tabComponents[activeTab]}
      </div>
    </div>
  )
}

