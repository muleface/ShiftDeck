import React, { useRef, useEffect, useState } from 'react';
import { Intern } from '../API_Services/Models';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, shift, arrow } from '@floating-ui/react-dom';
import './InternDropdown.css';

interface InternDropdownProps {
  // The information about which cell was clicked
  targetInfo: {
    dayIndex: number;
    stationNum: number;
  } | null;
  
  // The element that was clicked to trigger the dropdown
  targetElement: HTMLElement | null;
  
  // The available interns to select from
  interns: Intern[];
  
  // Callback when an intern is selected
  onSelect: (intern: Intern | null, dayIndex: number, stationNum: number) => void;
  
  // Callback when the dropdown is closed without selection
  onClose: () => void;
}

function InternDropdown({
  targetInfo,
  targetElement,
  interns,
  onSelect,
  onClose
}: InternDropdownProps) {
  // Internal dropdown state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Reference for the arrow element
  const arrowRef = useRef<HTMLDivElement>(null);
  
  // Filter interns based on search term
  const filteredInterns = interns.filter(intern => 
    searchTerm === '' || 
    intern.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    intern.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Effect to handle opening/closing based on targetInfo and targetElement
  useEffect(() => {
    if (targetInfo && targetElement) {
      setIsOpen(true);
      setIsClosing(false);
      setSearchTerm('');
    } else {
      // If closing already initiated, don't interfere
      if (!isClosing && isOpen) {
        initiateClosing();
      }
    }
  }, [targetInfo, targetElement]);
  
  // Handle controlled closing with animation
  const initiateClosing = () => {
    if (isOpen && !isClosing) {
      setIsClosing(true);
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        setIsClosing(false);
        setIsOpen(false);
        onClose();
      }, 200); // Match CSS animation duration
    }
  };
  
  // Set up Floating UI for basic positioning
  const {
    x,
    y,
    strategy,
    refs,
    middlewareData,
    update
  } = useFloating({
    elements: {
      reference: targetElement
    },
    placement: 'bottom-start',
    middleware: [
      offset(4),
      shift({ padding: 8 }),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate
  });
  
  // Update reference element
  useEffect(() => {
    refs.setReference(targetElement);
  }, [targetElement, refs]);
  
  // Update position when content changes
  useEffect(() => {
    if ((isOpen || isClosing) && update) {
      update();
    }
  }, [isOpen, isClosing, update, filteredInterns]);
  
  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        refs.floating.current && 
        !refs.floating.current.contains(event.target as Node) &&
        targetElement !== event.target &&
        !targetElement?.contains(event.target as Node)
      ) {
        initiateClosing();
      }
    };
    
    if (isOpen && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isClosing, targetElement, refs.floating]);
  
  // Handle selecting an intern
  const handleSelectIntern = (intern: Intern | null) => {
    if (!targetInfo) return;
    
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
      onSelect(intern, targetInfo.dayIndex, targetInfo.stationNum);
    }, 200);
  };
  
  if (!isOpen && !isClosing || !targetInfo) return null;
  
  return createPortal(
    <div 
      className={`dropdown-container ${isClosing ? 'closing' : ''}`}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: targetElement?.getBoundingClientRect().width,
        maxHeight: '200px',
      }}
    >
      {/* Arrow */}
      <div
        ref={arrowRef}
        className="dropdown-arrow"
        style={{
          left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
        }}
      />
      
      {/* Search input */}
      <input
        type="text"
        className="search-input"
        placeholder="Search intern..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        autoFocus
      />
      
      {/* Unassign option */}
      <div className="dropdown-item" onClick={() => handleSelectIntern(null)}>
        [Unassign]
      </div>
      
      {/* Intern list */}
      {filteredInterns.map(intern => (
        <div 
          key={intern.id}
          className="dropdown-item"
          onClick={() => handleSelectIntern(intern)}
        >
          {intern.firstName} {intern.lastName}
        </div>
      ))}
    </div>,
    document.body
  );
}

export default InternDropdown;