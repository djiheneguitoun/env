import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useFloorPlan, ElementType } from '../contexts/FloorPlanContext';
import { Upload, Circle, Triangle, Square, Trash2, Wand2, Eraser } from 'lucide-react';
import { processImage } from '../utils/imageProcessing';

const FloorPlanEditor: React.FC = () => {
  const {
    elements,
    addElement,
    updateElement,
    removeElement,
    imageData,
    setImageData,
    setExtractedLines,
    selectedTool,
    setSelectedTool,
    canvasWidth,
    canvasHeight,
    setCanvasDimensions,
  } = useFloorPlan();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentElement, setCurrentElement] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Draw the floor plan on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the uploaded image if available
    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw all elements
    elements.forEach((element) => {
      ctx.save();
      
      // Highlight selected or hovered element
      const isSelected = element.id === selectedElement;
      const isHovered = element.id === hoveredElement;
      
      switch (element.type) {
        case 'wall':
          ctx.beginPath();
          ctx.moveTo(element.x1, element.y1);
          if (element.x2 !== undefined && element.y2 !== undefined) {
            ctx.lineTo(element.x2, element.y2);
          }
          
          // Highlight selected or hovered wall
          if (isSelected) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 5;
          } else if (isHovered) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 4;
          } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
          }
          
          ctx.stroke();
          
          // Draw selection handles if selected
          if (isSelected && element.x2 !== undefined && element.y2 !== undefined) {
            // Start point handle
            ctx.beginPath();
            ctx.arc(element.x1, element.y1, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            
            // End point handle
            ctx.beginPath();
            ctx.arc(element.x2, element.y2, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
          }
          break;
          
        case 'door':
          // Draw door as a blue circle with better styling
          ctx.beginPath();
          ctx.arc(element.x1, element.y1, 15, 0, Math.PI * 2);
          
          // Highlight selected or hovered door
          if (isSelected) {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
          } else if (isHovered) {
            ctx.fillStyle = 'rgba(0, 128, 255, 0.6)';
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = 'rgba(0, 128, 255, 0.5)';
            ctx.strokeStyle = '#0080ff';
            ctx.lineWidth = 2;
          }
          
          ctx.fill();
          ctx.stroke();
          
          // Add a door symbol inside
          ctx.beginPath();
          ctx.moveTo(element.x1 - 8, element.y1);
          ctx.lineTo(element.x1 + 8, element.y1);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case 'window':
          // Draw window as an orange triangle with better styling
          ctx.beginPath();
          ctx.moveTo(element.x1, element.y1 - 15);
          ctx.lineTo(element.x1 + 15, element.y1 + 15);
          ctx.lineTo(element.x1 - 15, element.y1 + 15);
          ctx.closePath();
          
          // Highlight selected or hovered window
          if (isSelected) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.7)';
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
          } else if (isHovered) {
            ctx.fillStyle = 'rgba(255, 128, 0, 0.6)';
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2.5;
          } else {
            ctx.fillStyle = 'rgba(255, 128, 0, 0.5)';
            ctx.strokeStyle = '#ff8000';
            ctx.lineWidth = 2;
          }
          
          ctx.fill();
          ctx.stroke();
          
          // Add a window symbol inside
          ctx.beginPath();
          ctx.moveTo(element.x1 - 8, element.y1 + 5);
          ctx.lineTo(element.x1 + 8, element.y1 + 5);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    });

    // Draw current element being created
    if (isDrawing && startPoint && currentElement) {
      ctx.save();
      
      switch (selectedTool) {
        case 'wall':
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(currentElement.x2, currentElement.y2);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
          
        case 'door':
          // Draw door preview
          ctx.beginPath();
          ctx.arc(startPoint.x, startPoint.y, 15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 128, 255, 0.5)';
          ctx.fill();
          ctx.strokeStyle = '#0080ff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Add a door symbol inside
          ctx.beginPath();
          ctx.moveTo(startPoint.x - 8, startPoint.y);
          ctx.lineTo(startPoint.x + 8, startPoint.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case 'window':
          // Draw window preview
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y - 15);
          ctx.lineTo(startPoint.x + 15, startPoint.y + 15);
          ctx.lineTo(startPoint.x - 15, startPoint.y + 15);
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 128, 0, 0.5)';
          ctx.fill();
          ctx.strokeStyle = '#ff8000';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Add a window symbol inside
          ctx.beginPath();
          ctx.moveTo(startPoint.x - 8, startPoint.y + 5);
          ctx.lineTo(startPoint.x + 8, startPoint.y + 5);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    }
    
    // Draw eraser cursor if eraser tool is selected
    if (selectedTool === 'eraser' && hoveredElement) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(currentElement?.x || 0, currentElement?.y || 0, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [elements, imageData, isDrawing, startPoint, currentElement, selectedTool, selectedElement, hoveredElement]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to match image dimensions
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          setCanvasDimensions(img.width, img.height);
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            setImageData(imgData);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleExtractLines = async () => {
    if (!imageData) return;
    
    try {
      setIsProcessing(true);
      
      // Show processing indicator on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Processing image...', canvas.width / 2, canvas.height / 2);
          ctx.restore();
        }
      }
      
      const lines = await processImage(imageData);
      
      // Convert detected lines to wall elements
      const wallElements = lines.map((line) => ({
        type: 'wall' as ElementType,
        x1: line.x1,
        y1: line.y1,
        x2: line.x2,
        y2: line.y2,
      }));
      
      setExtractedLines(wallElements);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error extracting lines:', error);
      alert('Failed to extract lines from the image. Please try a different image.');
      setIsProcessing(false);
    }
  };

  // Find element under cursor
  const findElementUnderCursor = (x: number, y: number) => {
    // Check in reverse order to select the top-most element first
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      
      switch (element.type) {
        case 'wall':
          if (element.x2 !== undefined && element.y2 !== undefined) {
            // Calculate distance from point to line segment
            const A = x - element.x1;
            const B = y - element.y1;
            const C = element.x2 - element.x1;
            const D = element.y2 - element.y1;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            
            if (lenSq !== 0) param = dot / lenSq;
            
            let xx, yy;
            
            if (param < 0) {
              xx = element.x1;
              yy = element.y1;
            } else if (param > 1) {
              xx = element.x2;
              yy = element.y2;
            } else {
              xx = element.x1 + param * C;
              yy = element.y1 + param * D;
            }
            
            const dx = x - xx;
            const dy = y - yy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 10) {
              return element.id;
            }
          }
          break;
          
        case 'door':
        case 'window':
          // Simple distance check for doors and windows
          const distance = Math.sqrt(
            Math.pow(x - element.x1, 2) + Math.pow(y - element.y1, 2)
          );
          
          if (distance < 15) {
            return element.id;
          }
          break;
      }
    }
    
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProcessing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If eraser tool is selected, delete the element under cursor
    if (selectedTool === 'eraser') {
      const elementId = findElementUnderCursor(x, y);
      if (elementId) {
        removeElement(elementId);
        setSelectedElement(null);
      }
      return;
    }
    
    // If no tool is selected, try to select an element
    if (!selectedTool) {
      const elementId = findElementUnderCursor(x, y);
      setSelectedElement(elementId);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    
    if (selectedTool === 'wall') {
      setCurrentElement({
        type: 'wall',
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      });
    } else if (selectedTool === 'door') {
      addElement({
        type: 'door',
        x1: x,
        y1: y,
      });
      setIsDrawing(false);
    } else if (selectedTool === 'window') {
      addElement({
        type: 'window',
        x1: x,
        y1: y,
      });
      setIsDrawing(false);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update current element position for drawing
    if (isDrawing && startPoint && selectedTool === 'wall' && !isProcessing) {
      setCurrentElement({
        ...currentElement,
        x2: x,
        y2: y,
      });
    }
    
    // Update current position for eraser cursor
    if (selectedTool === 'eraser') {
      setCurrentElement({ x, y });
      
      // Highlight element under cursor
      const elementId = findElementUnderCursor(x, y);
      setHoveredElement(elementId);
    } else {
      // Clear hovered element if not using eraser
      if (hoveredElement) {
        setHoveredElement(null);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !startPoint || !currentElement || isProcessing) {
      setIsDrawing(false);
      return;
    }
    
    if (selectedTool === 'wall') {
      // Only add the wall if it has some length
      const length = Math.sqrt(
        Math.pow(currentElement.x2 - startPoint.x, 2) + 
        Math.pow(currentElement.y2 - startPoint.y, 2)
      );
      
      if (length > 5) {
        addElement({
          type: 'wall',
          x1: startPoint.x,
          y1: startPoint.y,
          x2: currentElement.x2,
          y2: currentElement.y2,
        });
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentElement(null);
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear all elements?')) {
      // Keep the image data but remove all elements
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Remove all elements
      elements.forEach(element => {
        removeElement(element.id);
      });
      
      setSelectedElement(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedElement) {
      removeElement(selectedElement);
      setSelectedElement(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Upload size={16} />
          <span>Upload Floor Plan</span>
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          variant={selectedTool === 'wall' ? 'primary' : 'outline'}
          onClick={() => {
            setSelectedTool(selectedTool === 'wall' ? null : 'wall');
            setSelectedElement(null);
          }}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Square size={16} />
          <span>Add Wall</span>
        </Button>
        
        <Button
          variant={selectedTool === 'door' ? 'primary' : 'outline'}
          onClick={() => {
            setSelectedTool(selectedTool === 'door' ? null : 'door');
            setSelectedElement(null);
          }}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Circle size={16} />
          <span>Add Door</span>
        </Button>
        
        <Button
          variant={selectedTool === 'window' ? 'primary' : 'outline'}
          onClick={() => {
            setSelectedTool(selectedTool === 'window' ? null : 'window');
            setSelectedElement(null);
          }}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Triangle size={16} />
          <span>Add Window</span>
        </Button>
        
        <Button
          variant={selectedTool === 'eraser' ? 'primary' : 'outline'}
          onClick={() => {
            setSelectedTool(selectedTool === 'eraser' ? null : 'eraser');
            setSelectedElement(null);
          }}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Eraser size={16} />
          <span>Delete Elements</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleExtractLines}
          disabled={!imageData || isProcessing}
          className="flex items-center gap-2"
        >
          <Wand2 size={16} />
          <span>{isProcessing ? 'Processing...' : 'Extract Lines'}</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleClearCanvas}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
          disabled={isProcessing}
        >
          <Trash2 size={16} />
          <span>Clear All</span>
        </Button>
        
        {selectedElement && (
          <Button
            variant="outline"
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={isProcessing}
          >
            <Trash2 size={16} />
            <span>Delete Selected</span>
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-auto bg-white">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className={`cursor-${
            isProcessing 
              ? 'wait' 
              : selectedTool === 'eraser' 
                ? 'crosshair' 
                : selectedTool 
                  ? 'crosshair' 
                  : 'default'
          }`}
        />
      </div>
      
      <div className="text-sm text-gray-500">
        {isProcessing ? (
          <p>Processing image... Please wait.</p>
        ) : selectedTool === 'eraser' ? (
          <p>Click on any element to delete it.</p>
        ) : selectedTool ? (
          <p>
            Currently adding: <span className="font-medium">{selectedTool}</span>. 
            {selectedTool === 'wall' ? ' Click and drag to draw walls.' : ' Click to place.'}
          </p>
        ) : selectedElement ? (
          <p>Element selected. Click "Delete Selected" to remove it.</p>
        ) : (
          <p>Select a tool from the toolbar to start editing or click on an element to select it.</p>
        )}
      </div>
    </div>
  );
};

export default FloorPlanEditor;