import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useContext } from 'react';
import { FaFileAlt, FaBell, FaHome, FaList, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { UserContext } from '@lib/context';

export default function PatientSidebar({ children }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useContext(UserContext);

  function SetOpen(){
    if(isOpen){
      setIsOpen(false)
    }else{
      setIsOpen(true)
    }
  }

  const handleLogout = () => {
    if (signOut) signOut();
    router.push('/login');
  };

  const menuItems = [
    {
        href: '/patient/notifications',
        title: 'Notifications',
        icon: <FaBell size={28}/>,
      },
    {
      href: '/patient/reports',
      title: 'Your Reports',
      icon: <FaFileAlt size={28}/>,
    },
  ];

  return (
    <div className=" flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-full">
          
          <span onClick={SetOpen} className=' absolute text-white md:hidden px-4 py-2 bg-green-600 z-10'>
            <FaList size={18}/>
          </span>

          <nav className={` md:flex md:w-60 w-16 h-full transition ease-in-out duration-300 bg-gray2 dark:bg-gray6 ${isOpen ? " absolute z-20": "hidden"}`}>
            <ul className="w-full flex flex-col mx-auto px-2 py-2">
              {/* Static Sidebar Icons */}
               <li onClick={SetOpen} className='px-2 md:hidden'>
               <FaArrowLeft className='text-red-400' size={20}/>  
               </li>

              <li key={'Dashboard'}>
              <div className="mt-4 md:mt-8"></div>
              <Link href="/patient">
                <div
                  className={`sidebar-icon group ${router.asPath === "/patient" && "dark:bg-blue-500 bg-blue-500 text-white"}`}
                >
                  <FaHome size={28} />
                  <span className="sidebar-tooltip group-hover:scale-100">
                    Dashboard
                  </span>
                </div>
              </Link>
              </li>
              <li key={'Divider'}>
              <Divider />
              </li>

              {/* Dynamic Sidebar Icons */}
              {menuItems.map(({ href, title, icon }) => (
                <li key={title}>
                <Link href={href}>
                  <div
                    className={`sidebar-icon group ${
                      router.asPath === href && "dark:bg-blue-500 bg-blue-500 text-white"
                    }`}
                  >
                    {icon}
                    <span className="sidebar-tooltip group-hover:scale-100">
                      {title}
                    </span>
                  </div>
                </Link>
                </li>
              ))}

              {/* Static Sidebar Icons */}
              <li key={'Divider2'}>
              <Divider />
              </li>

              <li key={'Logout'} onClick={handleLogout} className="cursor-pointer">
                <div className="sidebar-icon group hover:bg-red-500 hover:text-white">
                  <FaSignOutAlt size={28} className="text-red-400 group-hover:text-white" />
                  <span className="sidebar-tooltip group-hover:scale-100">
                    Logout
                  </span>
                </div>
              </li>
            </ul>
          </nav>

          <main className="flex flex-col w-full bg-gray-100 dark:bg-gray-900 overflow-x-hidden overflow-y-auto mb-14">
            <div className="flex flex-col w-full mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const Divider = () => <hr className="sidebar-hr my-2" />;