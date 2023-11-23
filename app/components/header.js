'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  {url: "/", name: "Home"},
  {url: "/rtsessanta", name: "RT60"},
  {url: "/grafico", name: "Grafico"}
]
/* Componente Header (si trova in layout principale) */
export function Header(){
	const pathname = usePathname().split("/")[1]; //Recuperto la prima parte dell'url per capire link attivo
		
  return (
    <div className="navbar">
      <div className='navbarTitle'>
        Tools Acustica
      </div>
      <div className='navbarLinks'>
        {menuItems.map((item, index) => (
          <Link 
            key={index}
            className={`navbarLink ${pathname === item.url.split("/")[1] && "active"}`} 
            href={item.url}
          >
            {item.name}
          </Link>
        ))}
      </div>

    </div>
  )
}