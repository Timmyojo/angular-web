import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  HostListener,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-generic-autocomplete",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./generic-autocomplete.component.html",
  styleUrls: ["./generic-autocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GenericAutoCompleteComponent),
      multi: true,
    },
  ],
})
export class GenericAutoCompleteComponent<T>
  implements OnInit, OnChanges, ControlValueAccessor
{
  @Input() items: T[] = [];
  @Input() displayFn: (item: T) => string = () => "";
  @Input() placeholder: string = "";
  @Input() disabled = false;

  @Output() itemSelected = new EventEmitter<T>();

  inputValue = "";
  filteredItems: T[] = [];
  selectedItem: T | null = null;
  dropdownOpen = false;

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredItems = [...this.items];
  }

  ngOnChanges(): void {
    this.filteredItems = [...this.items];
  }

  writeValue(value: T | null): void {
    this.selectedItem = value;
    this.inputValue = value ? this.displayFn(value) : "";
    this.filteredItems = [...this.items];
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onComponentClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleDropdown();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.filteredItems = [...this.items];
      this.inputValue = "";
    }
  }

  onInputChange(value: string): void {
    this.inputValue = value;
    const lower = value.toLowerCase();
    this.filteredItems = this.items.filter((item) =>
      this.displayFn(item).toLowerCase().includes(lower)
    );
  }

  onNativeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onInputChange(input.value);
  }

  onItemClick(item: T, event: MouseEvent): void {
    event.stopPropagation(); // Empêche la fermeture par `document:click`
    this.selectItem(item);
  }

  selectItem(item: T): void {
    this.selectedItem = item;
    this.inputValue = this.displayFn(item);
    this.dropdownOpen = false;
    this.onChange(item);
    this.itemSelected.emit(item);
  }

  onBlur(): void {
    this.onTouched();
  }

  @HostListener("document:click", ["$event"])
  closeDropdown(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }
}
