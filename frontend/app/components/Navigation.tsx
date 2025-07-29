'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Upload, Database, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'خانه', icon: Home },
    { href: '/finlandq', label: 'چت فنلاند', icon: MessageSquare },
    // { href: '/upload', label: 'آپلود فایل', icon: Upload },
    // { href: '/upload-text', label: 'آپلود متن', icon: Database },
    // { href: '/vector-management', label: 'مدیریت Vector', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/q.png" alt="FinlandQ" />
              <span className="mr-2 text-lg font-semibold text-gray-900">فنلاند کیو</span>
            </div>
          </div>
          
          <div className="flex space-x-8 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium gap-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}