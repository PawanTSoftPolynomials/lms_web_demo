'use client';

import {
  FaBook,
  FaLayerGroup,
  FaClipboardList,
  FaQuestionCircle,
} from 'react-icons/fa';

export default function RecentActivity() {
  const activities = [
    {
      title: 'Course Created',
      description: 'A new course was added.',
      icon: FaBook,
    },
    {
      title: 'Module Added',
      description: 'A modules was created.',
      icon: FaLayerGroup,
    },
    {
      title: 'Quiz Published',
      description: 'A quiz is available.',
      icon: FaClipboardList,
    },
    {
      title: 'Question Added',
      description: 'A question was created.',
      icon: FaQuestionCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activities.map((activity) => {
        const Icon = activity.icon;

        return (
          <div
            key={activity.title}
            className="
              bg-slate-800/40
              border
              border-slate-700
              rounded-xl
              p-4
              hover:border-orange-500
              transition
            "
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="
                  h-11
                  w-11
                  rounded-lg
                  bg-orange-500/20
                  text-orange-500
                  flex
                  items-center
                  justify-center
                  text-lg
                "
              >
                <Icon />
              </div>

              <h3 className="text-white font-semibold">{activity.title}</h3>
            </div>

            <p className="text-sm text-slate-400">{activity.description}</p>
          </div>
        );
      })}
    </div>
  );
}
