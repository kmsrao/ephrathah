import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { Dashboard } from './dashboard/dashboard';
import { Members } from './members/members';
import { WatchLive } from './watch-live/watch-live';
import { SubmitFeedback } from './submit-feedback/submit-feedback';
import { SubmitAccountability } from './submit-accountability/submit-accountability';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'members', component: Members, canActivate: [AuthGuard] },
  { path: 'watch-live', component: WatchLive, canActivate: [AuthGuard] },
  { path: 'submit-feedback', component: SubmitFeedback, canActivate: [AuthGuard] },
  { path: 'submit-accountability', component: SubmitAccountability, canActivate: [AuthGuard] },
];
