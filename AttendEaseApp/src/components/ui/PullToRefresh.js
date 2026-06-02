import { useState } from "react";
import {
    ScrollView,
    RefreshControl,
} from 'react-native';

export default function PullToRefresh({ children, onRefresh }) {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await onRefresh?.();
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
            }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#4F46E5" // Indigo color for iOS spinner
                    colors={["#4F46E5"]}
                    progressViewOffset={80}

                    
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    );
}