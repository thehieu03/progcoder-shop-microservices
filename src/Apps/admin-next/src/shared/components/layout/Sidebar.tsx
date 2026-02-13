import Link from 'next/link';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/orders' },
  { label: 'Customers', href: '/customers' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        ProG Admin
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white">
          Logout
        </button>
      </div>
    </aside>
  );
}
