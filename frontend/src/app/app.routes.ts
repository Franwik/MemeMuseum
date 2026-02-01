import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SearchComponent } from './pages/search/search';
import { MemeDetailsComponent } from './pages/memedetails/memedetails';

export const routes: Routes = [
  {path: '',
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    { path: 'search', component: SearchComponent },
    { path: 'details/:id', component: MemeDetailsComponent }
  ]

},
{ path: '**', redirectTo: 'home' }

];
