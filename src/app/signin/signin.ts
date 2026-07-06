import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'app-signin',
  imports: [CommonModule,AppHeader],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class Signin {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  calculator = inject(SpatialCostCalculator);

  constructor() {
    if (typeof document !== 'undefined') {
      this.calculator.clearSessionCookie();
    }
  }

  isLoginMode = true;

  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirm = '';
  signupCompanyName = '';
  signupCompanyWebsite = '';
  signupContactNumber = '';
  selectedCountry = { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' };
  showSignupPassword = false;
  showSignupConfirm = false;
  isCountryDropdownOpen = false;
  countrySearch = '';

  /** All countries with computed flag emojis from ISO codes */
  countries = this.buildCountryList();

  private buildCountryList() {
    const raw: { code: string; dial: string; name: string }[] = [
      // ── Americas ──
      { code: 'US', dial: '+1', name: 'United States' },
      { code: 'CA', dial: '+1', name: 'Canada' },
      { code: 'MX', dial: '+52', name: 'Mexico' },
      { code: 'BR', dial: '+55', name: 'Brazil' },
      { code: 'AR', dial: '+54', name: 'Argentina' },
      { code: 'CO', dial: '+57', name: 'Colombia' },
      { code: 'CL', dial: '+56', name: 'Chile' },
      { code: 'PE', dial: '+51', name: 'Peru' },
      { code: 'EC', dial: '+593', name: 'Ecuador' },
      { code: 'VE', dial: '+58', name: 'Venezuela' },
      { code: 'BO', dial: '+591', name: 'Bolivia' },
      { code: 'PY', dial: '+595', name: 'Paraguay' },
      { code: 'UY', dial: '+598', name: 'Uruguay' },
      { code: 'GY', dial: '+592', name: 'Guyana' },
      { code: 'SR', dial: '+597', name: 'Suriname' },
      { code: 'GT', dial: '+502', name: 'Guatemala' },
      { code: 'HN', dial: '+504', name: 'Honduras' },
      { code: 'SV', dial: '+503', name: 'El Salvador' },
      { code: 'NI', dial: '+505', name: 'Nicaragua' },
      { code: 'CR', dial: '+506', name: 'Costa Rica' },
      { code: 'PA', dial: '+507', name: 'Panama' },
      { code: 'BZ', dial: '+501', name: 'Belize' },
      { code: 'CU', dial: '+53', name: 'Cuba' },
      { code: 'DO', dial: '+1-809', name: 'Dominican Republic' },
      { code: 'HT', dial: '+509', name: 'Haiti' },
      { code: 'JM', dial: '+1-876', name: 'Jamaica' },
      { code: 'TT', dial: '+1-868', name: 'Trinidad & Tobago' },
      { code: 'BS', dial: '+1-242', name: 'Bahamas' },
      { code: 'BB', dial: '+1-246', name: 'Barbados' },
      { code: 'AG', dial: '+1-268', name: 'Antigua & Barbuda' },
      { code: 'DM', dial: '+1-767', name: 'Dominica' },
      { code: 'GD', dial: '+1-473', name: 'Grenada' },
      { code: 'KN', dial: '+1-869', name: 'St. Kitts & Nevis' },
      { code: 'LC', dial: '+1-758', name: 'St. Lucia' },
      { code: 'VC', dial: '+1-784', name: 'St. Vincent & Grenadines' },
      // ── Europe ──
      { code: 'GB', dial: '+44', name: 'United Kingdom' },
      { code: 'DE', dial: '+49', name: 'Germany' },
      { code: 'FR', dial: '+33', name: 'France' },
      { code: 'IT', dial: '+39', name: 'Italy' },
      { code: 'ES', dial: '+34', name: 'Spain' },
      { code: 'PT', dial: '+351', name: 'Portugal' },
      { code: 'NL', dial: '+31', name: 'Netherlands' },
      { code: 'BE', dial: '+32', name: 'Belgium' },
      { code: 'CH', dial: '+41', name: 'Switzerland' },
      { code: 'AT', dial: '+43', name: 'Austria' },
      { code: 'SE', dial: '+46', name: 'Sweden' },
      { code: 'NO', dial: '+47', name: 'Norway' },
      { code: 'DK', dial: '+45', name: 'Denmark' },
      { code: 'FI', dial: '+358', name: 'Finland' },
      { code: 'IE', dial: '+353', name: 'Ireland' },
      { code: 'PL', dial: '+48', name: 'Poland' },
      { code: 'CZ', dial: '+420', name: 'Czech Republic' },
      { code: 'SK', dial: '+421', name: 'Slovakia' },
      { code: 'HU', dial: '+36', name: 'Hungary' },
      { code: 'RO', dial: '+40', name: 'Romania' },
      { code: 'BG', dial: '+359', name: 'Bulgaria' },
      { code: 'GR', dial: '+30', name: 'Greece' },
      { code: 'HR', dial: '+385', name: 'Croatia' },
      { code: 'SI', dial: '+386', name: 'Slovenia' },
      { code: 'RS', dial: '+381', name: 'Serbia' },
      { code: 'BA', dial: '+387', name: 'Bosnia & Herzegovina' },
      { code: 'ME', dial: '+382', name: 'Montenegro' },
      { code: 'MK', dial: '+389', name: 'North Macedonia' },
      { code: 'AL', dial: '+355', name: 'Albania' },
      { code: 'XK', dial: '+383', name: 'Kosovo' },
      { code: 'EE', dial: '+372', name: 'Estonia' },
      { code: 'LV', dial: '+371', name: 'Latvia' },
      { code: 'LT', dial: '+370', name: 'Lithuania' },
      { code: 'IS', dial: '+354', name: 'Iceland' },
      { code: 'LU', dial: '+352', name: 'Luxembourg' },
      { code: 'MT', dial: '+356', name: 'Malta' },
      { code: 'CY', dial: '+357', name: 'Cyprus' },
      { code: 'MC', dial: '+377', name: 'Monaco' },
      { code: 'LI', dial: '+423', name: 'Liechtenstein' },
      { code: 'SM', dial: '+378', name: 'San Marino' },
      { code: 'VA', dial: '+379', name: 'Vatican City' },
      { code: 'AD', dial: '+376', name: 'Andorra' },
      { code: 'FO', dial: '+298', name: 'Faroe Islands' },
      { code: 'GI', dial: '+350', name: 'Gibraltar' },
      // ── Asia ──
      { code: 'JP', dial: '+81', name: 'Japan' },
      { code: 'CN', dial: '+86', name: 'China' },
      { code: 'IN', dial: '+91', name: 'India' },
      { code: 'KR', dial: '+82', name: 'South Korea' },
      { code: 'SG', dial: '+65', name: 'Singapore' },
      { code: 'HK', dial: '+852', name: 'Hong Kong' },
      { code: 'TW', dial: '+886', name: 'Taiwan' },
      { code: 'MY', dial: '+60', name: 'Malaysia' },
      { code: 'TH', dial: '+66', name: 'Thailand' },
      { code: 'VN', dial: '+84', name: 'Vietnam' },
      { code: 'PH', dial: '+63', name: 'Philippines' },
      { code: 'ID', dial: '+62', name: 'Indonesia' },
      { code: 'BD', dial: '+880', name: 'Bangladesh' },
      { code: 'PK', dial: '+92', name: 'Pakistan' },
      { code: 'LK', dial: '+94', name: 'Sri Lanka' },
      { code: 'NP', dial: '+977', name: 'Nepal' },
      { code: 'BT', dial: '+975', name: 'Bhutan' },
      { code: 'MV', dial: '+960', name: 'Maldives' },
      { code: 'MM', dial: '+95', name: 'Myanmar' },
      { code: 'KH', dial: '+855', name: 'Cambodia' },
      { code: 'LA', dial: '+856', name: 'Laos' },
      { code: 'MN', dial: '+976', name: 'Mongolia' },
      { code: 'BN', dial: '+673', name: 'Brunei' },
      { code: 'TL', dial: '+670', name: 'Timor-Leste' },
      { code: 'MO', dial: '+853', name: 'Macau' },
      { code: 'AF', dial: '+93', name: 'Afghanistan' },
      { code: 'IR', dial: '+98', name: 'Iran' },
      { code: 'IQ', dial: '+964', name: 'Iraq' },
      { code: 'SY', dial: '+963', name: 'Syria' },
      { code: 'LB', dial: '+961', name: 'Lebanon' },
      { code: 'JO', dial: '+962', name: 'Jordan' },
      { code: 'YE', dial: '+967', name: 'Yemen' },
      { code: 'OM', dial: '+968', name: 'Oman' },
      { code: 'KW', dial: '+965', name: 'Kuwait' },
      { code: 'BH', dial: '+973', name: 'Bahrain' },
      { code: 'QA', dial: '+974', name: 'Qatar' },
      { code: 'AE', dial: '+971', name: 'United Arab Emirates' },
      { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
      { code: 'TR', dial: '+90', name: 'Turkey' },
      { code: 'IL', dial: '+972', name: 'Israel' },
      { code: 'PS', dial: '+970', name: 'Palestine' },
      { code: 'KZ', dial: '+7', name: 'Kazakhstan' },
      { code: 'UZ', dial: '+998', name: 'Uzbekistan' },
      { code: 'TM', dial: '+993', name: 'Turkmenistan' },
      { code: 'KG', dial: '+996', name: 'Kyrgyzstan' },
      { code: 'TJ', dial: '+992', name: 'Tajikistan' },
      { code: 'AZ', dial: '+994', name: 'Azerbaijan' },
      { code: 'GE', dial: '+995', name: 'Georgia' },
      { code: 'AM', dial: '+374', name: 'Armenia' },
      { code: 'KP', dial: '+850', name: 'North Korea' },
      // ── Africa ──
      { code: 'ZA', dial: '+27', name: 'South Africa' },
      { code: 'NG', dial: '+234', name: 'Nigeria' },
      { code: 'EG', dial: '+20', name: 'Egypt' },
      { code: 'KE', dial: '+254', name: 'Kenya' },
      { code: 'GH', dial: '+233', name: 'Ghana' },
      { code: 'MA', dial: '+212', name: 'Morocco' },
      { code: 'DZ', dial: '+213', name: 'Algeria' },
      { code: 'TN', dial: '+216', name: 'Tunisia' },
      { code: 'LY', dial: '+218', name: 'Libya' },
      { code: 'SD', dial: '+249', name: 'Sudan' },
      { code: 'SS', dial: '+211', name: 'South Sudan' },
      { code: 'ET', dial: '+251', name: 'Ethiopia' },
      { code: 'SO', dial: '+252', name: 'Somalia' },
      { code: 'DJ', dial: '+253', name: 'Djibouti' },
      { code: 'ER', dial: '+291', name: 'Eritrea' },
      { code: 'TZ', dial: '+255', name: 'Tanzania' },
      { code: 'UG', dial: '+256', name: 'Uganda' },
      { code: 'RW', dial: '+250', name: 'Rwanda' },
      { code: 'BI', dial: '+257', name: 'Burundi' },
      { code: 'CD', dial: '+243', name: 'DR Congo' },
      { code: 'CG', dial: '+242', name: 'Congo' },
      { code: 'GA', dial: '+241', name: 'Gabon' },
      { code: 'GQ', dial: '+240', name: 'Equatorial Guinea' },
      { code: 'CM', dial: '+237', name: 'Cameroon' },
      { code: 'CF', dial: '+236', name: 'Central African Republic' },
      { code: 'TD', dial: '+235', name: 'Chad' },
      { code: 'NE', dial: '+227', name: 'Niger' },
      { code: 'ML', dial: '+223', name: 'Mali' },
      { code: 'BF', dial: '+226', name: 'Burkina Faso' },
      { code: 'MR', dial: '+222', name: 'Mauritania' },
      { code: 'SN', dial: '+221', name: 'Senegal' },
      { code: 'GM', dial: '+220', name: 'Gambia' },
      { code: 'GN', dial: '+224', name: 'Guinea' },
      { code: 'GW', dial: '+245', name: 'Guinea-Bissau' },
      { code: 'SL', dial: '+232', name: 'Sierra Leone' },
      { code: 'LR', dial: '+231', name: 'Liberia' },
      { code: 'CI', dial: '+225', name: "Côte d'Ivoire" },
      { code: 'TG', dial: '+228', name: 'Togo' },
      { code: 'BJ', dial: '+229', name: 'Benin' },
      { code: 'AO', dial: '+244', name: 'Angola' },
      { code: 'ZM', dial: '+260', name: 'Zambia' },
      { code: 'ZW', dial: '+263', name: 'Zimbabwe' },
      { code: 'MW', dial: '+265', name: 'Malawi' },
      { code: 'MZ', dial: '+258', name: 'Mozambique' },
      { code: 'BW', dial: '+267', name: 'Botswana' },
      { code: 'NA', dial: '+264', name: 'Namibia' },
      { code: 'SZ', dial: '+268', name: 'Eswatini' },
      { code: 'LS', dial: '+266', name: 'Lesotho' },
      { code: 'MG', dial: '+261', name: 'Madagascar' },
      { code: 'MU', dial: '+230', name: 'Mauritius' },
      { code: 'SC', dial: '+248', name: 'Seychelles' },
      { code: 'KM', dial: '+269', name: 'Comoros' },
      { code: 'CV', dial: '+238', name: 'Cabo Verde' },
      { code: 'ST', dial: '+239', name: 'São Tomé & Príncipe' },
      { code: 'RE', dial: '+262', name: 'Réunion' },
      // ── Oceania ──
      { code: 'AU', dial: '+61', name: 'Australia' },
      { code: 'NZ', dial: '+64', name: 'New Zealand' },
      { code: 'FJ', dial: '+679', name: 'Fiji' },
      { code: 'PG', dial: '+675', name: 'Papua New Guinea' },
      { code: 'SB', dial: '+677', name: 'Solomon Islands' },
      { code: 'VU', dial: '+678', name: 'Vanuatu' },
      { code: 'WS', dial: '+685', name: 'Samoa' },
      { code: 'TO', dial: '+676', name: 'Tonga' },
      { code: 'KI', dial: '+686', name: 'Kiribati' },
      { code: 'MH', dial: '+692', name: 'Marshall Islands' },
      { code: 'FM', dial: '+691', name: 'Micronesia' },
      { code: 'PW', dial: '+680', name: 'Palau' },
      { code: 'NR', dial: '+674', name: 'Nauru' },
      { code: 'TV', dial: '+688', name: 'Tuvalu' },
      { code: 'NC', dial: '+687', name: 'New Caledonia' },
      { code: 'PF', dial: '+689', name: 'French Polynesia' },
      { code: 'GU', dial: '+1-671', name: 'Guam' },
      // ── Caribbean & Atlantic Territories ──
      { code: 'BM', dial: '+1-441', name: 'Bermuda' },
      { code: 'KY', dial: '+1-345', name: 'Cayman Islands' },
      { code: 'AI', dial: '+1-264', name: 'Anguilla' },
      { code: 'MS', dial: '+1-664', name: 'Montserrat' },
      { code: 'VG', dial: '+1-284', name: 'British Virgin Islands' },
      { code: 'VI', dial: '+1-340', name: 'U.S. Virgin Islands' },
      { code: 'TC', dial: '+1-649', name: 'Turks & Caicos Islands' },
      { code: 'AW', dial: '+297', name: 'Aruba' },
      { code: 'CW', dial: '+5999', name: 'Curaçao' },
      { code: 'SX', dial: '+1-721', name: 'Sint Maarten' },
      { code: 'MF', dial: '+590', name: 'Saint Martin' },
      { code: 'BL', dial: '+590', name: 'Saint Barthélemy' },
      { code: 'PM', dial: '+508', name: 'St. Pierre & Miquelon' },
      { code: 'GL', dial: '+299', name: 'Greenland' },
    ];
    // Sort alphabetically by name
    raw.sort((a, b) => a.name.localeCompare(b.name));
    // Compute flag emoji from ISO country code
    return raw.map(c => ({
      ...c,
      flag: String.fromCodePoint(...c.code.split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)),
    }));
  }

  get filteredCountries() {
    const q = this.countrySearch.toLowerCase().trim();
    if (!q) return this.countries;
    return this.countries.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    );
  }

  errorMessage = '';
  isLoading = false;
  fieldErrors: Record<string, boolean> = {};

  clearFieldErrors() {
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  setFieldErrors(fields: string[]) {
    this.fieldErrors = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
  }

  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }
  selectCountry(country: { code: string; dial: string; flag: string; name: string }) {
    this.selectedCountry = country;
    this.isCountryDropdownOpen = false;
  }

  toggleCountryDropdown() {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9+]/g, '');
    this.signupContactNumber = input.value;
    this.clearFieldErrors();
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.clearFieldErrors();
    const errFields: string[] = [];
    if (!this.loginEmail.trim()) errFields.push('loginEmail');
    if (!this.loginPassword.trim()) errFields.push('loginPassword');
    if (errFields.length) {
      this.setFieldErrors(errFields);
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
    this.calculator.apiLogin(this.loginEmail.trim(), this.loginPassword.trim())
      .then(user => {
        this.calculator.loginUser(user.email, user.role, user.id, user.token);
        if (user.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/projects']);
        }
      })
      .catch(err => {
        this.errorMessage = err.message || 'Invalid email or password.';
        this.setFieldErrors(['loginEmail', 'loginPassword']);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  isSignupEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  onSignup() {
    this.errorMessage = '';
    this.clearFieldErrors();
    const errFields: string[] = [];
    if (!this.signupUsername.trim()) errFields.push('signupUsername');
    if (!this.signupEmail.trim()) errFields.push('signupEmail');
    if (!this.signupPassword.trim()) errFields.push('signupPassword');
    if (!this.signupConfirm.trim()) errFields.push('signupConfirm');
    if (!this.signupCompanyName.trim()) errFields.push('signupCompanyName');
    if (!this.signupCompanyWebsite.trim()) errFields.push('signupCompanyWebsite');
    if (!this.signupContactNumber.trim()) errFields.push('signupContactNumber');
    if (errFields.length) {
      this.setFieldErrors(errFields);
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (!this.isSignupEmailValid(this.signupEmail)) {
      this.setFieldErrors(['signupEmail']);
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }
    if (this.signupPassword !== this.signupConfirm) {
      this.setFieldErrors(['signupPassword', 'signupConfirm']);
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
    this.calculator.apiSignup(
      this.signupUsername.trim(),
      this.signupPassword.trim(),
      this.signupEmail.trim(),
      this.signupCompanyName.trim() || undefined,
      this.signupCompanyWebsite.trim() || undefined,
      this.signupContactNumber.trim() || undefined
    )
      .then(user => {
        this.calculator.loginUser(user.email, user.role, user.id, user.token);
        this.router.navigate(['/projects']);
      })
      .catch(err => {
        this.errorMessage = err.message || 'Failed to create account.';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  setTab(tab: 'home' | 'portfolio' | 'config') {
    this.calculator.setTab(tab);
    this.router.navigate(['/']);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }

  signIn() {
    this.router.navigate(['/login']);
  }
}
