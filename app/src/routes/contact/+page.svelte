<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  $effect(() => { goto(`${base}/incident`, { replaceState: true }); });
</script>
