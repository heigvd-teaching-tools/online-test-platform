import Image from 'next/image'
const Logo = ({ color = 'white' }) => (
  <Image
    alt="HEIG-VD - Logo"
    src={`/heig-2020-slim-${color}.svg`}
    width={38}
    height={38}
    priority="1"
  />
)
export default Logo
