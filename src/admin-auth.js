import { supabase } from './services/supabase.js';


export async function requireAdmin() {

    // -----------------------------------------
    // 1. Check login session
    // -----------------------------------------

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();


    if (sessionError) {

        console.error(
            'FreshCart: Session check failed',
            sessionError
        );

        window.location.href = '/admin-login.html';

        return false;
    }


    // -----------------------------------------
    // 2. User is not logged in
    // -----------------------------------------

    if (!session) {

        console.log(
            'FreshCart: No admin session'
        );

        window.location.href = '/admin-login.html';

        return false;
    }


    // -----------------------------------------
    // 3. Get logged-in user's ID
    // -----------------------------------------

    const userId =
        session.user.id;


    console.log(
        'FreshCart: Logged-in user:',
        session.user.email
    );


    // -----------------------------------------
    // 4. Check admin_users table
    // -----------------------------------------

    const {
        data: adminUser,
        error: adminError
    } = await supabase
        .from('admin_users')
        .select('id, user_id, email')
        .eq('user_id', userId)
        .maybeSingle();


    // -----------------------------------------
    // 5. Database error
    // -----------------------------------------

    if (adminError) {

        console.error(
            'FreshCart: Admin verification failed',
            adminError
        );

        alert(
            'Unable to verify admin permissions.'
        );

        return false;
    }


    // -----------------------------------------
    // 6. User is NOT an admin
    // -----------------------------------------

    if (!adminUser) {

        console.warn(
            'FreshCart: User is not an admin'
        );

        alert(
            'Access denied. Admin account required.'
        );

        await supabase.auth.signOut();

        window.location.href =
            '/admin-login.html';

        return false;
    }


    // -----------------------------------------
    // 7. User is an admin
    // -----------------------------------------

    console.log(
        'FreshCart: Admin verified ✓',
        adminUser.email
    );


    return true;
}


// =============================================
// LOGOUT
// =============================================

export async function logoutAdmin() {

    console.log(
        'FreshCart: Logging out...'
    );


    const { error } =
        await supabase.auth.signOut();


    if (error) {

        console.error(
            'FreshCart: Logout failed',
            error
        );

        alert(
            error.message ||
            'Unable to logout.'
        );

        return false;
    }


    console.log(
        'FreshCart: Logout successful ✓'
    );


    window.location.href =
        '/admin-login.html';


    return true;
}