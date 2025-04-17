import React, { useRef, useEffect, useState } from 'react';
import { Intern } from './API_Services/Models';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, shift, arrow } from '@floating-ui/react-dom';
import './InternDropdown.css';

interface InternDropdownProps {
  isOpen: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (intern: Intern | null) => void;
  interns: Intern[];
  referenceElement: HTMLElement | null;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

const InternDropdown: React.FC<InternDropdownProps> = ({
  isOpen,
  searchTerm,
  onSearchChange,
  onClose,
  onSelect,
  interns,
  referenceElement,
  tableContainerRef
}) => {
  const arrowRef = useRef<HTMLDivElement>(null);
  const [dropdownState, setDropdownState] = useState({
    isVisible: true,
    isClosing: false,
    placement: 'bottom' as 'top' | 'bottom'
  });
  
  // Filter interns based on search term
  const filteredInterns = interns.filter(intern => 
    searchTerm === '' || 
    intern.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    intern.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle closing with animation
  const handleClose = () => {
    if (isOpen && !dropdownState.isClosing) {
      setDropdownState(state => ({ ...state, isClosing: true }));
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        setDropdownState(state => ({ ...state, isClosing: false }));
        onClose();
      }, 200); // Match CSS animation duration
    }
  };

  // Reset closing state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setDropdownState(state => ({ ...state, isClosing: false }));
    }
  }, [isOpen]);

  // Handle positioning and visibility
  useEffect(() => {
    if (!isOpen || dropdownState.isClosing || !referenceElement || !tableContainerRef.current) return;
    
    const updatePosition = () => {
      if (!referenceElement || !tableContainerRef.current) return;
      
      const tableRect = tableContainerRef.current.getBoundingClientRect();
      const cellRect = referenceElement.getBoundingClientRect();
      
      // Check if reference is in view
      const isOutsideBounds = 
        cellRect.bottom > tableRect.bottom || 
        cellRect.top < tableRect.top;
      
      if (isOutsideBounds) {
        // Only update state if visibility changes
        if (dropdownState.isVisible) {
          setDropdownState(state => ({ ...state, isVisible: false }));
          handleClose();
        }
        return;
      }
      
      // Determine placement
      const spaceBelow = tableRect.bottom - cellRect.bottom;
      const estimatedHeight = Math.min(35 + filteredInterns.length * 35, 200);
      const placement = spaceBelow < estimatedHeight ? 'top' : 'bottom';
      
      // Only update state if values actually changed
      if (!dropdownState.isVisible || dropdownState.placement !== placement) {
        setDropdownState(state => ({ 
          ...state, 
          isVisible: true,
          placement
        }));
      }
    };
    
    // Initial position check
    updatePosition();
    
    // Add scroll listener
    const container = tableContainerRef.current;
    container.addEventListener('scroll', updatePosition);
    
    return () => {
      container.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, dropdownState.isClosing, referenceElement, tableContainerRef, filteredInterns.length, handleClose, dropdownState.isVisible, dropdownState.placement]);
  
  // Set up Floating UI
  const {
    x,
    y,
    strategy,
    refs,
    middlewareData,
    update
  } = useFloating({
    elements: {
      reference: referenceElement
    },
    placement: `${dropdownState.placement}-start` as any,
    middleware: [
      offset(4),
      shift({ padding: 8 }),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate
  });

  // Update reference element
  useEffect(() => {
    refs.setReference(referenceElement);
  }, [referenceElement, refs]);

  // Update position when content changes
  useEffect(() => {
    if ((isOpen || dropdownState.isClosing) && update) {
      update();
    }
  }, [isOpen, dropdownState.isClosing, update, filteredInterns, dropdownState.placement]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        refs.floating.current && 
        !refs.floating.current.contains(event.target as Node) &&
        referenceElement !== event.target &&
        !referenceElement?.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen && !dropdownState.isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, dropdownState.isClosing, handleClose, referenceElement, refs.floating]);

  // Handle selecting an intern
  const handleSelectIntern = (intern: Intern | null) => {
    setDropdownState(state => ({ ...state, isClosing: true }));
    setTimeout(() => {
      setDropdownState(state => ({ ...state, isClosing: false }));
      onSelect(intern);
    }, 200);
  };

  if ((!isOpen && !dropdownState.isClosing) || !dropdownState.isVisible) return null;

  // Determine arrow position
  const staticSide = dropdownState.placement === 'top' ? 'bottom' : 'top';

  return createPortal(
    <div 
      className={`dropdown-container ${dropdownState.isClosing ? 'closing' : ''}`}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: referenceElement?.getBoundingClientRect().width,
        maxHeight: '200px',
      }}
      data-placement={dropdownState.placement}
    >
      {/* Arrow */}
      <div
        ref={arrowRef}
        className="dropdown-arrow"
        style={{
          left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
          top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
          [staticSide]: '-4px',
        }}
      />
      
      {/* Search input */}
      <input
        type="text"
        className="search-input"
        placeholder="Search intern..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
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
};

export default InternDropdown;