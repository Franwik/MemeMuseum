import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { SearchComponent } from './pages/search/search';
import { MemeDetailsComponent } from './pages/memedetails/memedetails';

export const routes: Routes = [
  {path: '',
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    { path: 'search', component: SearchComponent },
    { path: 'details/:id', component: MemeDetailsComponent }
  ]

},
{ path: '**', redirectTo: 'home' }

];
