import React, { createContext, useContext, useState, useEffect } from 'react';

export type ElementType = 'wall' | 'door' | 'window';

export interface FloorPlanElement {
  id: string;
  type: ElementType;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

interface FloorPlanContextType {
  elements: FloorPlanElement[];
  addElement: (element: Omit<FloorPlanElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<FloorPlanElement>) => void;
  removeElement: (id: string) => void;
  imageData: ImageData | null;
  setImageData: (data: ImageData | null) => void;
  extractedLines: FloorPlanElement[];
  setExtractedLines: (lines: FloorPlanElement[]) => void;
  selectedTool: ElementType | 'eraser' | null;
  setSelectedTool: (tool: ElementType | 'eraser' | null) => void;
  canvasWidth: number;
  canvasHeight: number;
  setCanvasDimensions: (width: number, height: number) => void;
}

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (!context) {
    throw new Error('useFloorPlan must be used within a FloorPlanProvider');
  }
  return context;
};

export const FloorPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [extractedLines, setExtractedLines] = useState<FloorPlanElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType | 'eraser' | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  const addElement = (element: Omit<FloorPlanElement, 'id'>) => {
    const newElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setElements((prev) => [...prev, newElement]);
  };

  const updateElement = (id: string, updates: Partial<FloorPlanElement>) => {
    setElements((prev) =>
      prev.map((element) => (element.id === id ? { ...element, ...updates } : element))
    );
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
  };

  const setCanvasDimensions = (width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

  // When lines are extracted, add them to the elements
  useEffect(() => {
    if (extractedLines.length > 0) {
      setElements((prev) => [
        ...prev.filter((el) => el.type !== 'wall'),
        ...extractedLines,
      ]);
    }
  }, [extractedLines]);

  return (
    <FloorPlanContext.Provider
      value={{
        elements,
        addElement,
        updateElement,
        removeElement,
        imageData,
        setImageData,
        extractedLines,
        setExtractedLines,
        selectedTool,
        setSelectedTool,
        canvasWidth,
        canvasHeight,
        setCanvasDimensions,
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};