import React from 'react';
import CanvasArea from '../components/Editor/CanvasArea';
import Toolbox from '../components/Editor/Toolbox';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import Layout  from '../Components/Layout/Layout';

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
