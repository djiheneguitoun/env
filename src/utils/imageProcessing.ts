import { FloorPlanElement } from '../contexts/FloorPlanContext';

// This function will process the image and extract lines
export const processImage = async (imageData: ImageData): Promise<Omit<FloorPlanElement, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Put the image data on the canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to grayscale and apply threshold
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Improved grayscale conversion and thresholding
      for (let i = 0; i < data.length; i += 4) {
        // Better grayscale formula (weighted RGB)
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Adaptive threshold - use a lower threshold for better line detection
        const threshold = 200; // Adjust this value based on image brightness
        const val = gray < threshold ? 0 : 255;
        
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      // Improved line detection with better sampling
      const lines: Omit<FloorPlanElement, 'id'>[] = [];
      const minLineLength = 15; // Minimum line length to consider
      const lineGap = 5;       // Gap between sampling lines
      
      // Sample horizontal lines with better density
      for (let y = 0; y < canvas.height; y += lineGap) {
        let lineStart: { x: number, y: number } | null = null;
        let blackPixelCount = 0;
        
        for (let x = 0; x < canvas.width; x++) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const isBlack = pixel[0] < 128;
          
          if (isBlack) {
            if (!lineStart) {
              lineStart = { x, y };
            }
            blackPixelCount++;
          } else if (lineStart) {
            // End of line found
            if (blackPixelCount > minLineLength) {
              lines.push({
                type: 'wall',
                x1: lineStart.x,
                y1: lineStart.y,
                x2: x - 1, // Last black pixel
                y2: y,
              });
            }
            lineStart = null;
            blackPixelCount = 0;
          }
        }
        
        // Handle case where line extends to edge of image
        if (lineStart && blackPixelCount > minLineLength) {
          lines.push({
            type: 'wall',
            x1: lineStart.x,
            y1: lineStart.y,
            x2: canvas.width - 1,
            y2: lineStart.y,
          });
        }
      }
      
      // Sample vertical lines with better density
      for (let x = 0; x < canvas.width; x += lineGap) {
        let lineStart: { x: number, y: number } | null = null;
        let blackPixelCount = 0;
        
        for (let y = 0; y < canvas.height; y++) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const isBlack = pixel[0] < 128;
          
          if (isBlack) {
            if (!lineStart) {
              lineStart = { x, y };
            }
            blackPixelCount++;
          } else if (lineStart) {
            // End of line found
            if (blackPixelCount > minLineLength) {
              lines.push({
                type: 'wall',
                x1: lineStart.x,
                y1: lineStart.y,
                x2: x,
                y2: y - 1, // Last black pixel
              });
            }
            lineStart = null;
            blackPixelCount = 0;
          }
        }
        
        // Handle case where line extends to edge of image
        if (lineStart && blackPixelCount > minLineLength) {
          lines.push({
            type: 'wall',
            x1: lineStart.x,
            y1: lineStart.y,
            x2: lineStart.x,
            y2: canvas.height - 1,
          });
        }
      }
      
      // Filter out duplicate or very similar lines
      const filteredLines = filterDuplicateLines(lines);
      
      // Connect nearby line segments
      const connectedLines = connectLineSegments(filteredLines);
      
      resolve(connectedLines);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to filter out duplicate or very similar lines
function filterDuplicateLines(lines: Omit<FloorPlanElement, 'id'>[]): Omit<FloorPlanElement, 'id'>[] {
  const result: Omit<FloorPlanElement, 'id'>[] = [];
  const threshold = 5; // Distance threshold for considering lines as duplicates
  
  for (const line of lines) {
    let isDuplicate = false;
    
    for (const existingLine of result) {
      // Check if lines are parallel and close to each other
      const isHorizontalLine1 = Math.abs(line.y1 - line.y2!) < threshold;
      const isHorizontalLine2 = Math.abs(existingLine.y1 - existingLine.y2!) < threshold;
      
      if (isHorizontalLine1 && isHorizontalLine2) {
        // Both are horizontal lines
        if (Math.abs(line.y1 - existingLine.y1) < threshold) {
          // Lines are close to each other vertically
          const overlapStart = Math.max(line.x1, existingLine.x1);
          const overlapEnd = Math.min(line.x2!, existingLine.x2!);
          
          if (overlapEnd > overlapStart) {
            // Lines overlap horizontally
            isDuplicate = true;
            break;
          }
        }
      } else {
        const isVerticalLine1 = Math.abs(line.x1 - line.x2!) < threshold;
        const isVerticalLine2 = Math.abs(existingLine.x1 - existingLine.x2!) < threshold;
        
        if (isVerticalLine1 && isVerticalLine2) {
          // Both are vertical lines
          if (Math.abs(line.x1 - existingLine.x1) < threshold) {
            // Lines are close to each other horizontally
            const overlapStart = Math.max(line.y1, existingLine.y1);
            const overlapEnd = Math.min(line.y2!, existingLine.y2!);
            
            if (overlapEnd > overlapStart) {
              // Lines overlap vertically
              isDuplicate = true;
              break;
            }
          }
        }
      }
    }
    
    if (!isDuplicate) {
      result.push(line);
    }
  }
  
  return result;
}

// Helper function to connect nearby line segments
function connectLineSegments(lines: Omit<FloorPlanElement, 'id'>[]): Omit<FloorPlanElement, 'id'>[] {
  const result: Omit<FloorPlanElement, 'id'>[] = [...lines];
  const threshold = 10; // Distance threshold for connecting lines
  let madeChanges = true;
  
  // Keep connecting lines until no more connections can be made
  while (madeChanges) {
    madeChanges = false;
    
    for (let i = 0; i < result.length; i++) {
      const line1 = result[i];
      
      for (let j = i + 1; j < result.length; j++) {
        const line2 = result[j];
        
        // Check if lines are collinear and can be connected
        const isHorizontalLine1 = Math.abs(line1.y1 - line1.y2!) < threshold;
        const isHorizontalLine2 = Math.abs(line2.y1 - line2.y2!) < threshold;
        
        if (isHorizontalLine1 && isHorizontalLine2 && Math.abs(line1.y1 - line2.y1) < threshold) {
          // Both are horizontal lines at similar height
          // Check if endpoints are close
          const dist1 = Math.abs(line1.x2! - line2.x1);
          const dist2 = Math.abs(line1.x1 - line2.x2!);
          
          if (dist1 < threshold) {
            // Connect line1.end to line2.start
            result[i] = {
              ...line1,
              x2: line2.x2,
              y2: line2.y2,
            };
            result.splice(j, 1); // Remove line2
            madeChanges = true;
            break;
          } else if (dist2 < threshold) {
            // Connect line2.end to line1.start
            result[i] = {
              ...line1,
              x1: line2.x1,
              y1: line2.y1,
            };
            result.splice(j, 1); // Remove line2
            madeChanges = true;
            break;
          }
        } else {
          const isVerticalLine1 = Math.abs(line1.x1 - line1.x2!) < threshold;
          const isVerticalLine2 = Math.abs(line2.x1 - line2.x2!) < threshold;
          
          if (isVerticalLine1 && isVerticalLine2 && Math.abs(line1.x1 - line2.x1) < threshold) {
            // Both are vertical lines at similar x-position
            // Check if endpoints are close
            const dist1 = Math.abs(line1.y2! - line2.y1);
            const dist2 = Math.abs(line1.y1 - line2.y2!);
            
            if (dist1 < threshold) {
              // Connect line1.end to line2.start
              result[i] = {
                ...line1,
                x2: line2.x2,
                y2: line2.y2,
              };
              result.splice(j, 1); // Remove line2
              madeChanges = true;
              break;
            } else if (dist2 < threshold) {
              // Connect line2.end to line1.start
              result[i] = {
                ...line1,
                x1: line2.x1,
                y1: line2.y1,
              };
              result.splice(j, 1); // Remove line2
              madeChanges = true;
              break;
            }
          }
        }
      }
      
      if (madeChanges) break;
    }
  }
  
  return result;
}

// In a real implementation, we would load OpenCV.js like this:
/*
let opencv: any = null;

export const loadOpenCV = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (opencv) {
      resolve(opencv);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
    script.async = true;
    script.onload = () => {
      opencv = (window as any).cv;
      if (opencv) {
        resolve(opencv);
      } else {
        reject(new Error('OpenCV.js failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load OpenCV.js'));
    };
    document.body.appendChild(script);
  });
};

export const processImageWithOpenCV = async (imageData: ImageData): Promise<Omit<FloorPlanElement, 'id'>[]> => {
  try {
    const cv = await loadOpenCV();
    
    // Convert ImageData to cv.Mat
    const src = cv.matFromImageData(imageData);
    const dst = new cv.Mat();
    
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    
    // Apply Canny edge detection
    const edges = new cv.Mat();
    cv.Canny(dst, edges, 50, 150, 3);
    
    // Apply Hough Line Transform
    const lines = new cv.Mat();
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);
    
    // Convert detected lines to our format
    const wallElements: Omit<FloorPlanElement, 'id'>[] = [];
    for (let i = 0; i < lines.rows; ++i) {
      const [x1, y1, x2, y2] = [
        lines.data32S[i * 4],
        lines.data32S[i * 4 + 1],
        lines.data32S[i * 4 + 2],
        lines.data32S[i * 4 + 3]
      ];
      
      wallElements.push({
        type: 'wall',
        x1,
        y1,
        x2,
        y2,
      });
    }
    
    // Clean up
    src.delete();
    dst.delete();
    edges.delete();
    lines.delete();
    
    return wallElements;
  } catch (error) {
    console.error('OpenCV processing error:', error);
    throw error;
  }
};
*/