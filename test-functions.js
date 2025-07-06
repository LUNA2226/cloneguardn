// Test script to verify Supabase Edge Functions are working
// Run this in your browser console or as a Node.js script

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key

async function testFunctions() {
    console.log('🧪 Testing Supabase Edge Functions...');
    
    // Test 1: Check if script-generator function is accessible
    try {
        console.log('\n1️⃣ Testing script-generator function...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/script-generator`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        if (response.status === 401) {
            console.log('✅ Function is accessible (401 = needs authentication, which is expected)');
        } else {
            console.log('Response:', await response.text());
        }
    } catch (error) {
        console.error('❌ Error testing script-generator:', error);
    }
    
    // Test 2: Check if script-tracker function is accessible
    try {
        console.log('\n2️⃣ Testing script-tracker function...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/script-tracker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scriptId: 'test',
                eventType: 'test',
                domain: 'test.com'
            })
        });
        
        console.log('Status:', response.status);
        console.log('Response:', await response.text());
        
        if (response.status === 404 || response.status === 400) {
            console.log('✅ Function is accessible (error is expected for test data)');
        }
    } catch (error) {
        console.error('❌ Error testing script-tracker:', error);
    }
    
    // Test 3: Check if stripe-checkout function is accessible
    try {
        console.log('\n3️⃣ Testing stripe-checkout function...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        console.log('Status:', response.status);
        if (response.status === 401 || response.status === 400) {
            console.log('✅ Function is accessible (error is expected without auth/data)');
        }
    } catch (error) {
        console.error('❌ Error testing stripe-checkout:', error);
    }
    
    console.log('\n🎉 Function testing complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure you have a Supabase project connected');
    console.log('2. Ensure environment variables are set in Supabase');
    console.log('3. Use the CloneGuard dashboard to generate a real script');
    console.log('4. Test the script on the provided test HTML page');
}

// Uncomment the line below to run the test
// testFunctions();

console.log('📋 Instructions:');
console.log('1. Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values');
console.log('2. Uncomment the last line and run this script');
console.log('3. Or copy-paste the testFunctions() call in your browser console');