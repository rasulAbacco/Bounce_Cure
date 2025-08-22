import React from 'react';
import CanvasArea from '../Components/Editor/CanvasArea';
import Toolbox from '../Components/Editor/Toolbox';
import PropertiesPanel from '../Components/Editor/PropertiesPanel';
import Layout from '../Components/Layout/Layout';

const EditorPage = () => {
    return (
        <Layout>
            <div className="flex h-screen bg-black">
                <Toolbox />
                <CanvasArea />
                <PropertiesPanel />
            </div>
        </Layout>
    );
};

export default EditorPage;
