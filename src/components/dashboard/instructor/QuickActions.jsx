import Link from 'next/link';

import {
  FaBook,
  FaLayerGroup,
  FaClipboardList,
  FaQuestionCircle,
} from 'react-icons/fa';

export default function QuickActions() {
  const actions = [
    {
      title: 'Course',
      icon: FaBook,
      href: '/instructor/courses/create',
    },
    {
      title: 'Module',
      icon: FaLayerGroup,
      href: '/instructor/modules',
    },
    {
      title: 'Quiz',
      icon: FaClipboardList,
      href: '/instructor/quizzes',
    },
    {
      title: 'Question',
      icon: FaQuestionCircle,
      href: '/instructor/questions',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.title}
            href={action.href}
            className="
              bg-slate-800
              border
              border-slate-700
              hover:border-orange-500
              hover:bg-slate-700
              rounded-xl
              p-3
              flex
              flex-col
              items-center
              justify-center
              gap-2
              transition
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-lg
                bg-orange-500/15
                flex
                items-center
                justify-center
              "
            >
              <Icon className="text-orange-500 text-lg" />
            </div>

            <span className="text-sm font-medium text-white">
              {action.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
