import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';

const generateId = () => Math.random().toString(36).substring(2, 9);

const renderMarkdown = (text) => {
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/\n/g, '<br/>'); // Preserve line breaks visually
    return { __html: html || '<br/>' };
};

const PlannerEditor = ({ blocks, onChange }) => {
    const [focusedId, setFocusedId] = useState(null);
    const textareaRefs = useRef({});

    // Use a locally derived array if blocks is empty, so we don't trigger an immediate save loop
    const displayBlocks = (!blocks || blocks.length === 0) 
        ? [{ id: 'empty-init', type: 'paragraph', content: '' }] 
        : blocks;

    const updateBlock = (id, newProps) => {
        if (id === 'empty-init') {
            const newId = generateId();
            onChange([{ id: newId, type: 'paragraph', content: '', ...newProps }]);
            setFocusedId(newId);
            return;
        }
        onChange(displayBlocks.map(b => b.id === id ? { ...b, ...newProps } : b));
    };

    const addBlockAfter = (id, type = 'paragraph') => {
        const index = displayBlocks.findIndex(b => b.id === id);
        const newBlock = { id: generateId(), type, content: '' };
        const newBlocks = [...displayBlocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
        setFocusedId(newBlock.id);
    };

    const removeBlock = (id) => {
        if (displayBlocks.length === 1) {
            updateBlock(id, { type: 'paragraph', content: '' });
            return;
        }
        const index = displayBlocks.findIndex(b => b.id === id);
        const prevId = index > 0 ? displayBlocks[index - 1].id : displayBlocks[index + 1].id;
        onChange(displayBlocks.filter(b => b.id !== id));
        setFocusedId(prevId);
    };

    const handleKeyDown = (e, index, block) => {
        if (e.key === 'Enter') {
            // Allow multiline freely for normal paragraphs!
            if (block.type === 'paragraph') {
                return; // Let the native \n insert into the textarea
            }
            
            // Only spawn new blocks for structured lists
            e.preventDefault();
            let nextType = 'paragraph';
            if (block.type === 'checkbox') nextType = 'checkbox';
            if (block.type === 'bullet') nextType = 'bullet';
            if (block.type === 'number') nextType = 'number';
            addBlockAfter(block.id, nextType);
        } else if (e.key === 'Backspace' && block.content === '') {
            e.preventDefault();
            if (block.type !== 'paragraph') {
                updateBlock(block.id, { type: 'paragraph' });
            } else {
                removeBlock(block.id);
            }
        } else if (e.key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            setFocusedId(blocks[index - 1].id);
        } else if (e.key === 'ArrowDown' && index < blocks.length - 1) {
            e.preventDefault();
            setFocusedId(blocks[index + 1].id);
        } else if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            applyFormatting(block.id, '**');
        } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            applyFormatting(block.id, '*');
        }
    };

    const applyFormatting = (id, marker) => {
        const textarea = textareaRefs.current[id];
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + marker + text.substring(start, end) + marker + text.substring(end);
        updateBlock(id, { content: newText });
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + marker.length, end + marker.length);
        }, 0);
    };

    const autoResize = (textarea) => {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const changeBlockType = (type) => {
        // If a block is focused, change its type
        if (focusedId) {
            updateBlock(focusedId, { type });
        } else {
            // Otherwise, change the last block's type and focus it
            const lastBlock = displayBlocks[displayBlocks.length - 1];
            updateBlock(lastBlock.id, { type });
            setFocusedId(lastBlock.id);
        }
    };

    const handleContainerClick = (e) => {
        // If they click the empty space below all blocks, focus the last block
        if (e.target === e.currentTarget) {
            const lastBlock = displayBlocks[displayBlocks.length - 1];
            setFocusedId(lastBlock.id);
        }
    };

    return (
        <div className="w-full flex flex-col h-full">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#141218]/50 overflow-x-auto shrink-0">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Format Line</span>
                <button 
                    onClick={() => changeBlockType('paragraph')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title="Text"
                >
                    <Icon name="type" size={16} /> Text
                </button>
                <button 
                    onClick={() => changeBlockType('checkbox')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title="Checkbox"
                >
                    <Icon name="check-square" size={16} /> Checkbox
                </button>
                <button 
                    onClick={() => changeBlockType('bullet')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title="Bullet List"
                >
                    <Icon name="list" size={16} /> Bullet
                </button>
                <button 
                    onClick={() => changeBlockType('number')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title="Numbered List"
                >
                    <Icon name="hash" size={16} /> Number
                </button>
            </div>

            <div className="w-full flex-1 p-8 pb-32 cursor-text overflow-y-auto" onClick={handleContainerClick}>
                {displayBlocks.map((block, index) => {
                    const isFocused = focusedId === block.id;

                let prefix = null;
                if (block.type === 'checkbox') {
                    prefix = (
                        <input 
                            type="checkbox" 
                            checked={!!block.checked}
                            onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
                            className="mt-[6px] w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                    );
                } else if (block.type === 'bullet') {
                    prefix = <span className="mt-[2px] text-2xl leading-none text-gray-400 dark:text-gray-500 select-none">•</span>;
                } else if (block.type === 'number') {
                    // Find actual number based on previous number blocks
                    let count = 1;
                    for (let i = 0; i < index; i++) {
                        if (blocks[i].type === 'number') count++;
                        else count = 1; // reset if interrupted? Usually standard lists don't reset unless interrupted. Let's just keep incrementing for consecutive.
                    }
                    prefix = <span className="mt-[2px] font-medium text-gray-500 select-none">{count}.</span>;
                }

                return (
                    <div 
                        key={block.id} 
                        className="flex gap-3 mb-2 group relative"
                        onClick={() => setFocusedId(block.id)}
                    >
                        {prefix && <div className="flex-shrink-0 flex items-start justify-center w-6">{prefix}</div>}
                        
                        <div className={`flex-1 min-h-[28px] ${block.type === 'checkbox' && block.checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {isFocused ? (
                                <textarea
                                    ref={el => {
                                        textareaRefs.current[block.id] = el;
                                        if (el && isFocused) {
                                            el.focus();
                                            autoResize(el);
                                        }
                                    }}
                                    value={block.content}
                                    onChange={(e) => {
                                        updateBlock(block.id, { content: e.target.value });
                                        autoResize(e.target);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, index, block)}
                                    onBlur={() => setFocusedId(null)}
                                    className="w-full bg-transparent resize-none focus:outline-none overflow-hidden m-0 p-0 text-[17px] leading-relaxed"
                                    rows={1}
                                    spellCheck="false"
                                />
                            ) : (
                                <div 
                                    className="text-[17px] leading-relaxed cursor-text min-h-[28px]"
                                    dangerouslySetInnerHTML={renderMarkdown(block.content)}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
};

export default PlannerEditor;
