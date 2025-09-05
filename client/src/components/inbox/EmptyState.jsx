import React from 'react';

const EmptyState = ({ message }) => {
    return (
        <div className="flex justify-center items-center p-6 text-zinc-400">
            {message}
        </div>
    );
};

export default EmptyState;
