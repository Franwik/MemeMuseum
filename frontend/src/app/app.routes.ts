import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { SearchComponent } from './pages/search/search';
import { MemeDetailsComponent } from './pages/memedetails/memedetails';
import { authGuard, guestGuard } from './_auth/auth.guard-guard';
import { CreateMemeComponent } from './pages/create-meme/create-meme';
import { ExploreMemeComponent } from './pages/explore-meme/explore-meme';

export const routes: Routes = [
  {path: '',
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'login', component: LoginComponent, canActivate: [guestGuard]},
    {path: 'register', component: RegisterComponent, canActivate: [guestGuard]},
    { path: 'search', component: SearchComponent},
    { path: 'details/:id', component: MemeDetailsComponent},
    {path: 'create', component: CreateMemeComponent, canActivate: [authGuard]},
    {path: 'explore', component: ExploreMemeComponent},
  ]

},
{ path: '**', redirectTo: 'home' }

];
