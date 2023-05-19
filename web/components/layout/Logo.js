import Image from 'next/image'
const Logo = ({ color = 'white' }) => (
  <Image
    alt="HEIG-VD - Logo"
    src={`/heig-2020-slim-${color}.svg`}
    layout="fixed"
    width="38px"
    height="38px"
    priority="1"
  />
)
export default Logo
