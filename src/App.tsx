import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import FloorPlanEditor from './components/FloorPlanEditor';
import ThreeDViewer from './components/ThreeDViewer';
import { FloorPlanProvider } from './contexts/FloorPlanContext';
import { Upload, Home, Cuboid as Cube } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <FloorPlanProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Floor Plan Editor</h1>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Home size={18} />
                <span>2D Editor</span>
              </TabsTrigger>
              <TabsTrigger value="3d" className="flex items-center gap-2">
                <Cube size={18} />
                <span>3D View</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-2">
              <FloorPlanEditor />
            </TabsContent>
            
            <TabsContent value="3d" className="mt-2">
              <ThreeDViewer />
            </TabsContent>
          </Tabs>
        </main>
        
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            Floor Plan Editor &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </FloorPlanProvider>
  );
}

export default App;