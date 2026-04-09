import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-dialog',
  imports: [FormsModule],
  templateUrl: './password-dialog.html',
  styleUrl: './password-dialog.css',
})
export class PasswordDialog {
  isOpen = input<boolean>(false);
  title = input<string>('Enter your password');
  description = input<string>(
    'To protect your data, please enter your password to save your mood entry.'
  );

  submitted = output<string>();
  canceled = output<void>();

  protected showPassword = signal(false);

  protected handleSave(password: string) {
    this.submitted.emit(password);
  }

  protected handleCancel() {
    this.canceled.emit();
  }
}
