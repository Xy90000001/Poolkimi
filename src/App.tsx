import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Configurator from '@/pages/Configurator'
import Gallery from '@/pages/Gallery'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configure" element={<Configurator />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Layout>
  )
}
